# kk/backend/api/routes/database.py
from flask import Blueprint, jsonify, request, g, send_file
from sqlalchemy import inspect, text, desc, Column, String, Integer, DateTime
from sqlalchemy.orm import class_mapper
from db.database import SessionLocal, Base, engine
from api.middleware.auth_middleware import admin_required
import pandas as pd
from fpdf import FPDF
import io
from datetime import datetime

database_bp = Blueprint('database', __name__)

def get_model_from_tablename(table_name):
    # This function maps a table name string to its SQLAlchemy model class
    # You might need to adjust this if your models are not directly in db.models
    # and if their __tablename__ doesn't directly match the class name (lowercase)
    for mapper in Base.registry.mappers:
        cls = mapper.class_
        if hasattr(cls, '__tablename__') and cls.__tablename__ == table_name:
            return cls
    return None

@database_bp.route('/', methods=['GET'])
@admin_required
def list_tables():
    db = SessionLocal()
    try:
        inspector = inspect(engine)
        table_names = inspector.get_table_names()
        return jsonify(table_names), 200
    except Exception as e:
        return jsonify({"error": f"Failed to list tables: {str(e)}"}), 500
    finally:
        db.close()

@database_bp.route('/<string:table_name>', methods=['GET', 'POST', 'PUT', 'DELETE'])
@admin_required
def manage_table_data(table_name):
    db = SessionLocal()
    try:
        Model = get_model_from_tablename(table_name)
        if not Model:
            return jsonify({"error": f"Table '{table_name}' not found or not mapped to a model."}), 404

        # Dynamically get primary key column name
        pk_column_name = None
        for col in class_mapper(Model).primary_key:
            pk_column_name = col.key
            break

        if request.method == 'GET':
            # Parameters for filtering, searching, pagination
            query_params = request.args
            query = db.query(Model)

            # Basic filtering (example: filter by any column)
            for key, value in query_params.items():
                if hasattr(Model, key):
                    query = query.filter(getattr(Model, key) == value)

            # Basic sorting (example: sort by id desc)
            if pk_column_name:
                query = query.order_by(desc(getattr(Model, pk_column_name)))

            # Pagination
            skip = int(query_params.get('skip', 0))
            limit = int(query_params.get('limit', 100))
            data = query.offset(skip).limit(limit).all()

            # Convert SQLAlchemy objects to dicts for JSON serialization
            result = []
            for item in data:
                item_dict = {}
                for col in item.__table__.columns:
                    value = getattr(item, col.name)
                    if isinstance(value, datetime):
                        item_dict[col.name] = value.isoformat()
                    elif isinstance(value, dict): # Handle JSONB columns
                        item_dict[col.name] = value
                    else:
                        item_dict[col.name] = value
                result.append(item_dict)

            return jsonify(result), 200

        elif request.method == 'POST':
            data = request.json
            new_item = Model(**data)
            db.add(new_item)
            db.commit()
            db.refresh(new_item)
            return jsonify({"message": "Row added successfully", "id": str(getattr(new_item, pk_column_name))}), 201

        elif request.method == 'PUT':
            item_id = request.args.get('id') # Expect ID in query param for PUT
            if not item_id:
                return jsonify({"error": "ID parameter missing for update"}), 400
            
            item = db.query(Model).filter(getattr(Model, pk_column_name) == item_id).first()
            if not item:
                return jsonify({"error": "Row not found"}), 404

            updates = request.json
            for key, value in updates.items():
                if hasattr(item, key):
                    setattr(item, key, value)
            db.commit()
            db.refresh(item)
            return jsonify({"message": "Row updated successfully"}), 200

        elif request.method == 'DELETE':
            item_id = request.args.get('id') # Expect ID in query param for DELETE
            if not item_id:
                return jsonify({"error": "ID parameter missing for delete"}), 400
            
            item = db.query(Model).filter(getattr(Model, pk_column_name) == item_id).first()
            if not item:
                return jsonify({"error": "Row not found"}), 404
            
            db.delete(item)
            db.commit()
            return jsonify({"message": "Row deleted successfully"}), 200

    except Exception as e:
        db.rollback()
        return jsonify({"error": f"Failed to manage table data: {str(e)}"}), 500
    finally:
        db.close()

@database_bp.route('/<string:table_name>/export/<string:file_format>', methods=['GET'])
@admin_required
def export_table_data(table_name, file_format):
    db = SessionLocal()
    try:
        Model = get_model_from_tablename(table_name)
        if not Model:
            return jsonify({"error": f"Table '{table_name}' not found or not mapped to a model."}), 404

        all_data = db.query(Model).all()

        if not all_data:
            return jsonify({"message": "No data to export."}), 404

        # Convert SQLAlchemy objects to list of dicts
        records = []
        for item in all_data:
            item_dict = {}
            for col in item.__table__.columns:
                value = getattr(item, col.name)
                if isinstance(value, datetime):
                    item_dict[col.name] = value.isoformat()
                else:
                    item_dict[col.name] = str(value) # Ensure all values are strings for export
            records.append(item_dict)

        df = pd.DataFrame(records)

        if file_format == 'csv':
            csv_buffer = io.StringIO()
            df.to_csv(csv_buffer, index=False)
            csv_buffer.seek(0)
            return send_file(
                io.BytesIO(csv_buffer.getvalue().encode('utf-8')),
                mimetype='text/csv',
                as_attachment=True,
                download_name=f'{table_name}_export.csv'
            )
        elif file_format == 'pdf':
            pdf = FPDF()
            pdf.add_page()
            pdf.set_font("Arial", size=10)

            # Add table headers
            col_width = pdf.w / (len(df.columns) + 1) # distribute width
            row_height = 8

            for col in df.columns:
                pdf.cell(col_width, row_height, str(col), border=1)
            pdf.ln(row_height)

            # Add table data
            for index, row in df.iterrows():
                for col_data in row:
                    pdf.cell(col_width, row_height, str(col_data), border=1)
                pdf.ln(row_height)

            pdf_buffer = io.BytesIO()
            pdf.output(pdf_buffer, 'S') # 'S' means return as string (bytes)
            pdf_buffer.seek(0)

            return send_file(
                pdf_buffer,
                mimetype='application/pdf',
                as_attachment=True,
                download_name=f'{table_name}_export.pdf'
            )
        else:
            return jsonify({"error": "Unsupported file format"}), 400

    except Exception as e:
        return jsonify({"error": f"Failed to export data: {str(e)}"}), 500
    finally:
        db.close()
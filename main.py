from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI
from sqlmodel import Session,select
from models import engine, Inventory 

app = FastAPI()

@app.get("/inventory")
def get_inventory():
    with Session(engine) as session:
        statement = select(Inventory)
        records = session.exec(statement).all()
        return records

@app.delete('/inventory/{id}')
def delete_item(id:int):
    with Session(engine) as session:
        statement = select(Inventory).where(Inventory.id == id)
        record = session.exec(statement).one()
        session.delete(record)
        session.commit()

app.mount("/", StaticFiles(directory="static", html=True), name="static")
from sqlmodel import SQLModel, Field, create_engine

engine = create_engine("sqlite:///inventory.db")


class Inventory(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    product_name: str
    category: str
    quantity: int
    price: float
    supplier: str | None = None

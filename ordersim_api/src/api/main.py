from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security.api_key import APIKeyHeader
from fastapi.openapi.utils import get_openapi
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from fastapi.responses import JSONResponse


app = FastAPI(
    title="OrderSim API (Mock)",
    description="Mock backend simulating an E-commerce backend for Users, Products, Orders, "
    "Shopping Cart, and Payments using in-memory storage.",
    version="1.0.0"
)

# ============ Mock API Key Authentication ==============
API_KEY = "test_api_key_123"  # In real scenarios, keep it confidential!
API_KEY_NAME = "Authorization"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)


# PUBLIC_INTERFACE
async def verify_api_key(
    authorization: Optional[str] = Depends(api_key_header)
):
    """Require Bearer API key in the Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated, missing Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    key = authorization[7:]
    if key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API Key",
        )
    return True


# ============ In-memory Data Stores ======================

users: Dict[int, Dict] = {}
products: Dict[int, Dict] = {}
orders: Dict[int, Dict] = {}
carts: Dict[int, Dict[str, Any]] = {}
payments: Dict[int, Dict] = {}

id_seq = {
    "user": 1,
    "product": 1,
    "order": 1,
    "payment": 1,
}


# ========== Models ======================================

# User Models
class UserCreate(BaseModel):
    username: str
    password: str


class User(BaseModel):
    id: int
    username: str


# Product Models
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    price: float
    stock: int


class Product(BaseModel):
    id: int
    name: str
    description: str
    price: float
    stock: int


# Cart Models
class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class CartItem(BaseModel):
    product_id: int
    name: str
    quantity: int
    price: float


class CartResponse(BaseModel):
    items: List[CartItem]
    total: float


# Order Models
class OrderCreate(BaseModel):
    user_id: int
    items: List[CartItemCreate]


class OrderItem(BaseModel):
    product_id: int
    name: str
    quantity: int
    price: float


class Order(BaseModel):
    id: int
    user_id: int
    items: List[OrderItem]
    status: str
    total: float


class OrderStatusUpdate(BaseModel):
    status: str  # e.g. "pending", "shipped", "delivered", "cancelled"


# Payment Models
class PaymentCreate(BaseModel):
    order_id: int
    amount: float
    payment_method: str  # "credit_card", "paypal" etc.


class Payment(BaseModel):
    id: int
    order_id: int
    amount: float
    status: str  # "success", "failed"
    payment_method: str


# ========== Endpoints ===============

@app.get("/")
async def health_check():
    return {"message": "Healthy"}


@app.post("/users", response_model=User, status_code=201, tags=["Users"])
async def create_user(data: UserCreate, auth=Depends(verify_api_key)):
    for u in users.values():
        if u['username'] == data.username:
            raise HTTPException(409, "Username already exists.")
    uid = id_seq["user"]
    users[uid] = {
        "id": uid,
        "username": data.username,
        "password": data.password
    }
    id_seq["user"] += 1
    return {"id": uid, "username": data.username}


@app.get("/users", response_model=List[User], tags=["Users"])
async def list_users(auth=Depends(verify_api_key)):
    return [User(id=u['id'], username=u['username']) for u in users.values()]


@app.get("/users/{user_id}", response_model=User, tags=["Users"])
async def get_user(user_id: int, auth=Depends(verify_api_key)):
    user = users.get(user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return User(id=user["id"], username=user["username"])


@app.delete("/users/{user_id}", status_code=204, tags=["Users"])
async def delete_user(user_id: int, auth=Depends(verify_api_key)):
    if user_id not in users:
        raise HTTPException(404, "User not found")
    del users[user_id]
    return JSONResponse(status_code=204, content=None)


@app.post("/products", response_model=Product, status_code=201, tags=["Products"])
async def create_product(data: ProductCreate, auth=Depends(verify_api_key)):
    pid = id_seq["product"]
    prod = {
        "id": pid,
        "name": data.name,
        "description": data.description or "",
        "price": data.price,
        "stock": data.stock
    }
    products[pid] = prod
    id_seq["product"] += 1
    return Product(**prod)


@app.get("/products", response_model=List[Product], tags=["Products"])
async def list_products(auth=Depends(verify_api_key)):
    return [Product(**prod) for prod in products.values()]


@app.get("/products/{product_id}", response_model=Product, tags=["Products"])
async def get_product(product_id: int, auth=Depends(verify_api_key)):
    prod = products.get(product_id)
    if not prod:
        raise HTTPException(404, "Product not found")
    return Product(**prod)


@app.delete("/products/{product_id}", status_code=204, tags=["Products"])
async def delete_product(product_id: int, auth=Depends(verify_api_key)):
    if product_id not in products:
        raise HTTPException(404, "Product not found")
    del products[product_id]
    return JSONResponse(status_code=204, content=None)


@app.post("/users/{user_id}/cart", response_model=CartResponse, tags=["Cart"])
async def add_to_cart(user_id: int, item: CartItemCreate, auth=Depends(verify_api_key)):
    if user_id not in users:
        raise HTTPException(404, "User not found")
    if item.product_id not in products:
        raise HTTPException(404, "Product not found")
    if products[item.product_id]["stock"] < item.quantity:
        raise HTTPException(400, "Not enough stock")

    cart = carts.setdefault(user_id, {"items": {}})
    cart['items'][item.product_id] = cart['items'].get(item.product_id, 0) + item.quantity

    items, total = _compose_cart(user_id)
    return CartResponse(items=items, total=total)


@app.get("/users/{user_id}/cart", response_model=CartResponse, tags=["Cart"])
async def get_cart(user_id: int, auth=Depends(verify_api_key)):
    items, total = _compose_cart(user_id)
    return CartResponse(items=items, total=total)


@app.delete("/users/{user_id}/cart", response_model=CartResponse, tags=["Cart"])
async def clear_cart(user_id: int, auth=Depends(verify_api_key)):
    carts[user_id] = {"items": {}}
    return CartResponse(items=[], total=0.0)


def _compose_cart(user_id: int):
    cart = carts.get(user_id, {"items": {}})
    items = []
    total = 0.0
    for pid, qty in cart["items"].items():
        prod = products.get(pid)
        if not prod:
            continue
        item = CartItem(
            product_id=pid,
            name=prod["name"],
            quantity=qty,
            price=prod["price"]
        )
        total += prod["price"] * qty
        items.append(item)
    return items, total


@app.post("/orders", response_model=Order, status_code=201, tags=["Orders"])
async def create_order(order: OrderCreate, auth=Depends(verify_api_key)):
    if order.user_id not in users:
        raise HTTPException(404, "User not found")

    items = []
    total = 0.0
    for cart_item in order.items:
        prod = products.get(cart_item.product_id)
        if not prod:
            raise HTTPException(404, f"Product ID {cart_item.product_id} not found")
        if prod["stock"] < cart_item.quantity:
            raise HTTPException(400, f"Not enough stock for {prod['name']}")
        prod["stock"] -= cart_item.quantity
        item_detail = OrderItem(
            product_id=cart_item.product_id,
            name=prod["name"],
            quantity=cart_item.quantity,
            price=prod["price"],
        )
        total += prod["price"] * cart_item.quantity
        items.append(item_detail)

    oid = id_seq["order"]
    odata = {
        "id": oid,
        "user_id": order.user_id,
        "items": [item.dict() for item in items],
        "status": "pending",
        "total": round(total, 2)
    }
    orders[oid] = odata
    id_seq["order"] += 1
    carts[order.user_id] = {"items": {}}
    return Order(**odata)


@app.get("/orders", response_model=List[Order], tags=["Orders"])
async def list_orders(
    user_id: Optional[int] = None,
    status_: Optional[str] = None,
    auth=Depends(verify_api_key),
):
    filtered = []
    for order in orders.values():
        if user_id is not None and order["user_id"] != user_id:
            continue
        if status_ is not None and order["status"] != status_:
            continue
        filtered.append(Order(**order))
    return filtered


@app.get("/orders/{order_id}", response_model=Order, tags=["Orders"])
async def get_order(order_id: int, auth=Depends(verify_api_key)):
    order = orders.get(order_id)
    if not order:
        raise HTTPException(404, "Order not found")
    return Order(**order)


@app.patch("/orders/{order_id}/status", response_model=Order, tags=["Orders"])
async def update_order_status(order_id: int, body: OrderStatusUpdate, auth=Depends(verify_api_key)):
    order = orders.get(order_id)
    if not order:
        raise HTTPException(404, "Order not found")
    order["status"] = body.status
    return Order(**order)


@app.delete("/orders/{order_id}", status_code=204, tags=["Orders"])
async def delete_order(order_id: int, auth=Depends(verify_api_key)):
    if order_id not in orders:
        raise HTTPException(404, "Order not found")
    del orders[order_id]
    return JSONResponse(status_code=204, content=None)


@app.post("/payments", response_model=Payment, status_code=201, tags=["Payments"])
async def create_payment(payment: PaymentCreate, auth=Depends(verify_api_key)):
    if payment.order_id not in orders:
        raise HTTPException(404, "Order not found")
    order = orders[payment.order_id]
    status_val = (
        "success" if round(order["total"], 2) == round(payment.amount, 2) else "failed"
    )
    pid = id_seq["payment"]
    pdata = {
        "id": pid,
        "order_id": payment.order_id,
        "amount": payment.amount,
        "payment_method": payment.payment_method,
        "status": status_val
    }
    payments[pid] = pdata
    id_seq["payment"] += 1
    return Payment(**pdata)


@app.get("/payments/{payment_id}", response_model=Payment, tags=["Payments"])
async def get_payment(payment_id: int, auth=Depends(verify_api_key)):
    pay = payments.get(payment_id)
    if not pay:
        raise HTTPException(404, "Payment not found")
    return Payment(**pay)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    for path in openapi_schema["paths"].values():
        for op in path.values():
            op["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi

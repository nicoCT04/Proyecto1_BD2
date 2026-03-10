from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "customer"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str

class MenuItemBase(BaseModel):
    name: str
    price: float
    description: Optional[str] = None
    category: str
    available: bool = True

class MenuItemCreate(MenuItemBase):
    restaurantId: str

class MenuItemResponse(MenuItemBase):
    id: str
    restaurantId: str
    timesOrdered: int = 0

class RestaurantBase(BaseModel):
    name: str
    address: str
    cuisineType: str

class RestaurantCreate(RestaurantBase):
    pass

class RestaurantResponse(RestaurantBase):
    id: str
    totalOrders: int = 0
    averageRating: float = 0.0
    totalReviews: int = 0
    averageQualityScore: float = 0.0

class OrderItem(BaseModel):
    name: str
    price: float
    quantity: int

class OrderCreate(BaseModel):
    userId: str
    restaurantId: str
    items: List[OrderItem]

class ReviewCreate(BaseModel):
    userId: str
    restaurantId: str
    orderId: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class InspectionCreate(BaseModel):
    restaurantId: str
    inspectorId: str
    score: int = Field(..., ge=0, le=10)
    observations: Optional[str] = None

from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

class Location(BaseModel):
    type: str = "Point"
    coordinates: List[float]

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "customer"
    location: Optional[Location] = None

class UserCreate(UserBase):
    password: Optional[str] = None

class UserResponse(UserBase):
    id: str
    createdAt: datetime

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
    address: Optional[str] = None
    cuisineType: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    location: Optional[Location] = None

class RestaurantCreate(RestaurantBase):
    pass

class RestaurantResponse(RestaurantBase):
    id: str
    totalOrders: int = 0
    averageRating: float = 0.0
    rating: float = 0.0 # Map from averageRating
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

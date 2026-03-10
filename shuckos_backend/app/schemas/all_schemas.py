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
    restaurant: str # Mapped from restaurantId for frontend compatibility

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
    user: str # userId
    restaurant: str # restaurantId
    items: List[OrderItem]
    totalAmount: Optional[float] = None
    status: Optional[str] = "pending"

class ReviewCreate(BaseModel):
    user: str # userId
    restaurant: str # restaurantId
    orderId: Optional[str] = None
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class InspectionScores(BaseModel):
    foodHandling: int = Field(..., ge=0, le=100)
    surfaceCleanliness: int = Field(..., ge=0, le=100)
    staffHygiene: int = Field(..., ge=0, le=100)

class InspectionCreate(BaseModel):
    restaurant: str # Mapped to restaurantId
    inspectorId: Optional[str] = None
    scores: InspectionScores
    overallScore: int = Field(..., ge=0, le=100)
    observations: Optional[str] = None
    inspectionDate: Optional[datetime] = None

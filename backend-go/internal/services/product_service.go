package services

import (
	"errors"
	"strings"

	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/config"
	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/models"
	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/utils"
	"gorm.io/gorm"
)

// ProductService handles product business logic
type ProductService struct {
	db *gorm.DB
}

// NewProductService creates a new product service instance
func NewProductService(db *gorm.DB) *ProductService {
	return &ProductService{db: db}
}

// ProductListRequest represents product listing filters
type ProductListRequest struct {
	Page     int      `form:"page"`
	Limit    int      `form:"limit"`
	Search   string   `form:"search"`
	MinPrice *int     `form:"minPrice"`
	MaxPrice *int     `form:"maxPrice"`
	Tags     []string `form:"tags"`
	SortBy   string   `form:"sortBy"` // price, rating, createdAt
	Order    string   `form:"order"`  // asc, desc
}

// ProductListResponse represents paginated product list
type ProductListResponse struct {
	Products   []models.Product   `json:"products"`
	Pagination utils.PaginationMeta `json:"pagination"`
}

// GetAll retrieves products with filtering, sorting, and pagination
func (s *ProductService) GetAll(req ProductListRequest) (*ProductListResponse, error) {
	// Set default values
	if req.Page < 1 {
		req.Page = 1
	}
	if req.Limit < 1 || req.Limit > 100 {
		req.Limit = 10
	}
	if req.SortBy == "" {
		req.SortBy = "createdAt"
	}
	if req.Order == "" {
		req.Order = "desc"
	}

	// Build query
	query := s.db.Model(&models.Product{})

	// Search filter (title, description, tags)
	if req.Search != "" {
		searchTerm := "%" + strings.ToLower(req.Search) + "%"
		query = query.Where(
			"LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) LIKE ?)",
			searchTerm, searchTerm, searchTerm,
		)
	}

	// Price filters
	if req.MinPrice != nil {
		query = query.Where("price >= ?", *req.MinPrice)
	}
	if req.MaxPrice != nil {
		query = query.Where("price <= ?", *req.MaxPrice)
	}

	// Tags filter (match any tag)
	if len(req.Tags) > 0 {
		query = query.Where("tags && ?", req.Tags)
	}

	// Count total
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, err
	}

	// Sorting
	validSortFields := map[string]bool{
		"price":     true,
		"rating":    true,
		"createdAt": true,
		"title":     true,
	}
	if !validSortFields[req.SortBy] {
		req.SortBy = "createdAt"
	}

	orderDir := "DESC"
	if strings.ToLower(req.Order) == "asc" {
		orderDir = "ASC"
	}

	// Apply sorting - need to use column name with quotes for camelCase
	sortColumn := req.SortBy
	if req.SortBy == "createdAt" {
		sortColumn = `"createdAt"`
	} else if req.SortBy == "imageUrl" {
		sortColumn = `"imageUrl"`
	}
	query = query.Order(sortColumn + " " + orderDir)

	// Pagination
	offset := (req.Page - 1) * req.Limit
	var products []models.Product
	if err := query.Offset(offset).Limit(req.Limit).Find(&products).Error; err != nil {
		return nil, err
	}

	// Calculate pagination metadata
	totalPages := int(total) / req.Limit
	if int(total)%req.Limit != 0 {
		totalPages++
	}

	pagination := utils.PaginationMeta{
		Total:       total,
		Page:        req.Page,
		Limit:       req.Limit,
		TotalPages:  totalPages,
		HasNext:     req.Page < totalPages,
		HasPrevious: req.Page > 1,
	}

	return &ProductListResponse{
		Products:   products,
		Pagination: pagination,
	}, nil
}

// GetByID retrieves a product by ID
func (s *ProductService) GetByID(id string) (*models.Product, error) {
	var product models.Product
	err := s.db.Where("id = ?", id).First(&product).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("product not found")
		}
		return nil, err
	}
	return &product, nil
}

// GetBySlug retrieves a product by slug
func (s *ProductService) GetBySlug(slug string) (*models.Product, error) {
	var product models.Product
	err := s.db.Where("slug = ?", slug).First(&product).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("product not found")
		}
		return nil, err
	}
	return &product, nil
}

// GetProductService returns a global product service instance
func GetProductService() *ProductService {
	return NewProductService(config.DB)
}

package utils

import "strconv"

// ParseInt converts string to int, returns 0 if invalid
func ParseInt(s string) int {
	val, err := strconv.Atoi(s)
	if err != nil {
		return 0
	}
	return val
}

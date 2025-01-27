package test

import (
	"LVerity/pkg/service"
	"testing"
)

func TestGeolocation(t *testing.T) {
	t.Run("GetLocationFromIP", func(t *testing.T) {
		testCases := []struct {
			name    string
			ip      string
			wantErr bool
		}{
			{
				name:    "Valid Public IP",
				ip:      "8.8.8.8", // Google's DNS server
				wantErr: false,
			},
			{
				name:    "Private IP",
				ip:      "192.168.1.1",
				wantErr: true,
			},
			{
				name:    "Invalid IP",
				ip:      "invalid-ip",
				wantErr: true,
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				location, err := service.GetLocationFromIP(tc.ip)
				
				if tc.wantErr {
					if err == nil {
						t.Error("Expected error but got none")
					}
					return
				}

				if err != nil {
					t.Errorf("Unexpected error: %v", err)
					return
				}

				if location == nil {
					t.Error("Expected location but got nil")
					return
				}

				// 验证位置信息的基本字段
				if location.Latitude == 0 && location.Longitude == 0 {
					t.Error("Both latitude and longitude are 0, which is unlikely for a valid IP")
				}
				if location.Country == "" {
					t.Error("Country should not be empty")
				}
			})
		}
	})
}

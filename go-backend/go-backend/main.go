package main

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"reflect"
	"time"

	"github.com/aviate-labs/agent-go"
	"github.com/aviate-labs/agent-go/candid"
	"github.com/aviate-labs/agent-go/identity"
	"github.com/aviate-labs/agent-go/principal"
	"github.com/gin-gonic/gin"
)

var RequestTypeCall = agent.RequestType(0)
var RequestTypeQuery = agent.RequestType(1)

type HashInfo struct {
	User      principal.Principal `ic:"user"`
	Timestamp uint64              `ic:"timestamp"`
}

func main() {
	//Parse the url
	hostURL, err := url.Parse("http://localhost:4943")
	if err != nil {
		panic(err)
	}

	// Set up the icp agent as a default user
	config := agent.Config{
		Identity:     new(identity.AnonymousIdentity),
		FetchRootKey: true,
		ClientConfig: []agent.ClientOption{
			agent.WithHostURL(hostURL),
		},
	}

	icAgent, err := agent.New(config)
	if err != nil {
		panic(err)
	}

	// set up canister id
	// make sure to change canister id
	canisterID, err := principal.Decode("u6s2n-gx777-77774-qaaba-cai")
	if err != nil {
		panic(err)
	}

	r := gin.Default()

	// Enable Cors
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	r.POST("/register", func(c *gin.Context) {
		// Read file or text from request
		file, _, err := c.Request.FormFile("file")
		if err != nil {
			c.JSON(400, gin.H{"error": "File not found"})
			return
		}
		defer file.Close()

		// compute hash
		hash := sha256.New()
		if _, err := io.Copy(hash, file); err != nil {
			c.JSON(500, gin.H{"error": "Error computing hash"})
			return
		}
		hashStr := hex.EncodeToString(hash.Sum(nil))

		// Call canister to register hash
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		// Create the request
		req, err := icAgent.CreateCandidAPIRequest(RequestTypeCall, canisterID, "register_hash", []interface{}{hashStr})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request: " + err.Error()})
			return
		}

		// Access the unexported data field using reflection
		v := reflect.ValueOf(*req)
		dataField := v.FieldByName("data")
		if !dataField.IsValid() {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not find data field"})
			return
		}

		// Get the data bytes directly if possible
		if dataField.Kind() == reflect.Slice && dataField.Type().Elem().Kind() == reflect.Uint8 {
			// Get the length of the slice
			length := dataField.Len()
			dataBytes := make([]byte, length)

			// Copy the bytes
			for i := 0; i < length; i++ {
				dataBytes[i] = byte(dataField.Index(i).Uint())
			}

			// Now use the data bytes
			_, err = icAgent.Client().Call(ctx, canisterID, dataBytes)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register hash: " + err.Error()})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid data field type"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Hash registered successfully", "hash": hashStr})
	})

	// Add verify endpoint
	r.POST("/verify", func(c *gin.Context) {
		var req struct {
			Hash string `json:"hash"`
		}
		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		// Create a new context for this request
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		// Create the request
		queryReq, err := icAgent.CreateCandidAPIRequest(RequestTypeQuery, canisterID, "get_hash_info", []interface{}{req.Hash})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request: " + err.Error()})
			return
		}

		// Access the unexported requestID field using reflection
		v := reflect.ValueOf(*queryReq)
		requestIDField := v.FieldByName("requestID")
		if !requestIDField.IsValid() {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not find requestID field"})
			return
		}

		// Convert the requestID to bytes
		requestIDBytes := make([]byte, requestIDField.Len())
		for i := 0; i < requestIDField.Len(); i++ {
			requestIDBytes[i] = byte(requestIDField.Index(i).Uint())
		}

		// Use the requestID bytes with the Query method
		resp, err := icAgent.Client().Query(ctx, canisterID, requestIDBytes)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query: " + err.Error()})
			return
		}

		// Parse the result - candid.Decode returns 3 values
		var result []HashInfo
		types, values, err := candid.Decode(resp)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode response: " + err.Error()})
			return
		}

		fmt.Println("Types:", types)
		fmt.Println("Types:", values)

		// Use Unmarshal after Decode to get the result into your struct
		if err := candid.Unmarshal(resp, []any{&result}); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unmarshal response: " + err.Error()})
			return
		}

		if len(result) == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Hash not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"user":      result[0].User.String(),
			"timestamp": result[0].Timestamp,
		})
	})

	r.Run(":8080")
}
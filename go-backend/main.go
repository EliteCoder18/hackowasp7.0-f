package main

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"github.com/aviate-labs/agent-go"
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

	canisterID, err := principal.Decode("uxrrr-q7777-77774-qaaaq-cai")
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
		// red file
		fileHeader, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
			return
		}
		fmt.Println("File Recevived")

		file, err := fileHeader.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to open file"})
			return
		}
		defer file.Close()

		fmt.Println("File Opened")

		hash := sha256.New()

		if _, err := io.Copy(hash, file); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read file"})
			return
		}

		hashString := hex.EncodeToString(hash.Sum(nil))
		fmt.Println("Hash: ", hashString)

		// TODO: Store empty values
		var result []any

		// Call method correctly - note we need to pass principal directly, not string
		err = icAgent.Call(canisterID, "register_hash", []any{hashString}, result)
		if err != nil {
			fmt.Println("ERROR calling canister:", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register hash: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Hash registered successfully", "hash": hashString})
	})
}

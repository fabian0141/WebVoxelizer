package main

import "net/http"

func main() {

	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// Define a handler function for the root URL ("/")
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "static/index.html")
	})

	// Start the HTTP server on port 8080
	http.ListenAndServe("localhost:34674", nil)
}

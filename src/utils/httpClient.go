package utils

import (
		"net"
	        "net/http"
		"time"
		"log"
)

var netTransport = &http.Transport{
        Dial: (&net.Dialer{
                Timeout: 5 * time.Second,
        }).Dial,
        TLSHandshakeTimeout: 5 * time.Second,
        MaxIdleConns:       50,
        IdleConnTimeout:    30 * time.Second,
        DisableCompression: true,
	DisableKeepAlives: false,
}

var netClient = &http.Client{
        Timeout: time.Millisecond * 500,
        Transport: netTransport,
}
/*
type HttpClient interface {
	HttpGet(url string) (*http.Response, error)
}
*/
func HttpGet(url string, headers map[string]string) (*http.Response, error) {
	req, err := http.NewRequest("GET", url, nil)
	if len(headers) > 0 {
		for k,v := range headers {
			req.Header.Add(k, v)
		}
	}
	response, err := netClient.Do(req)
	if err != nil {
		log.Println("Error: While getting resources from other services ",)
		return nil, err
	}

	return response,nil
}


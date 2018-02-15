FROM 370531249777.dkr.ecr.ap-south-1.amazonaws.com/golang:1.9.4

RUN mkdir -p /go/src/auth
WORKDIR /go/src/auth

COPY . .

RUN go get -d -v ./...
RUN go install -v ./...

CMD ["auth"]


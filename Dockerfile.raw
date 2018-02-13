FROM 370531249777.dkr.ecr.ap-south-1.amazonaws.com/golang:1.9.4

RUN mkdir -p /usr/src/auth
WORKDIR /usr/src/auth

ENV STAGE devo
ENV API_ENDPOINT https://internal-devo-lb-pvt-1359086914.ap-southeast-1.elb.amazonaws.com

COPY . .

RUN go get -d -v ./...
RUN go install -v ./...

CMD ["auth"]


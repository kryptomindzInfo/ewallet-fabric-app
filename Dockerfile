FROM node:8
# below config is used in connection.json file
COPY ./config/crypto-config/peerOrganizations/siliconvalley.com/users/Admin@siliconvalley.com/msp/ /opt/crypto/peerAdminMSP/
COPY ./config/crypto-config/peerOrganizations/siliconvalley.com/peers/peer1.siliconvalley.com/tls/ca.crt /opt/crypto/peer1Tls/ca.crt
COPY ./config/crypto-config/peerOrganizations/siliconvalley.com/peers/peer2.siliconvalley.com/tls/ca.crt /opt/crypto/peer2Tls/ca.crt
COPY ./config/crypto-config/ordererOrganizations/siliconvalley.com/orderers/orderer.siliconvalley.com/tls/ca.crt /opt/crypto/ordererTls/ca.crt
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN npm install
EXPOSE 8000
CMD [ "node", "server" ]

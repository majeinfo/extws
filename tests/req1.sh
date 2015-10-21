#!/bin/bash
#
curl -H "Content-Type: application/json" -d '{"status":"ok"}' localhost:3001/poller/devices
curl -H "Content-Type: application/json" -d '{"status":"ok", "key": "1234"}' localhost:3001/poller/devices
curl -H "Content-Type: application/json" -d '{"status":"ok", "key": "1234", "zid": "34601"}' localhost:3001/poller/devices

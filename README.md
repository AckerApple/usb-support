To get node-hid on Raspbian, I needed

```
sudo apt-get install g++ curl libssl-dev apache2-utils build-essential pkg-config git-core libudev-dev libusb-1.0-0-dev

sudo npm install node-gyp -g

npm install node-hid
```

- https://stackoverflow.com/questions/22144527/npm-fail-to-install-node-hid-faild-to-install-last-version-of-nodejs
To get node-hid on Raspbian, I needed

```
sudo apt-get install g++ curl
sudo apt-get install libssl-dev apache2-utils
sudo apt-get install build-essential
sudo apt-get install pkg-config

sudo npm install node-gyp -g

sudo apt-get install git-core
sudo apt-get install libudev-dev
sudo apt-get install libusb-1.0-0-dev

npm install node-hid
```

- https://stackoverflow.com/questions/22144527/npm-fail-to-install-node-hid-faild-to-install-last-version-of-nodejs
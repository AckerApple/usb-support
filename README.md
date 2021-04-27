To get node-hid on Raspbian, I needed

```
sudo apt-get install g++ curl libssl-dev apache2-utils build-essential pkg-config git-core libudev-dev libusb-1.0-0-dev

sudo npm install node-gyp -g

npm install node-hid
```

- https://stackoverflow.com/questions/22144527/npm-fail-to-install-node-hid-faild-to-install-last-version-of-nodejs


### Linux

To control usb devices without using `sudo`:

- Goto the directory `/etc/udev/rules.d`
- Edit a file named `99-com.rules` or create a new file such as `99-hidraw-permissions.rules`
  - Add to the top `KERNEL=="hidraw*", SUBSYSTEM=="hidraw", MODE="0664", GROUP="plugdev"`
- Unplug device
- Run command `sudo udevadm control --reload-rules`
- Plug device back in

> [allow all rule](https://unix.stackexchange.com/questions/85379/dev-hidraw-read-permissions/85459)
> [node-hide help on this subject here](https://www.npmjs.com/package/node-hid#linux-notes)


https://unix.stackexchange.com/questions/85379/dev-hidraw-read-permissions/85459
export interface USBDeviceInfo {
  deviceClass: number; // 0
  deviceProtocol: number; // 0
  deviceSubclass: number; // 0
  deviceVersionMajor: number; // 2
  deviceVersionMinor: number; // 0
  deviceVersionSubminor: number; // 1
  manufacturerName: string | undefined; // "Ledger"
  opened: boolean;
  productId: number; // 4113
  productName: string | undefined; // "Nano S"
  serialNumber: string | undefined; // "0001"
  usbVersionMajor: number; // 2
  usbVersionMinor: number; // 1
  usbVersionSubminor: number; // 0
  vendorId: number; // 11415
}

export function pickUSBDeviceInfo(usbDevice: USBDevice): USBDeviceInfo {
  const {
    deviceClass,
    deviceProtocol,
    deviceSubclass,
    deviceVersionMajor,
    deviceVersionMinor,
    deviceVersionSubminor,
    manufacturerName,
    opened,
    productId,
    productName,
    serialNumber,
    usbVersionMajor,
    usbVersionMinor,
    usbVersionSubminor,
    vendorId,
  } = usbDevice;

  return {
    deviceClass,
    deviceProtocol,
    deviceSubclass,
    deviceVersionMajor,
    deviceVersionMinor,
    deviceVersionSubminor,
    manufacturerName,
    opened,
    productId,
    productName,
    serialNumber,
    usbVersionMajor,
    usbVersionMinor,
    usbVersionSubminor,
    vendorId,
  };
}

export function getUSBDevices(): Promise<USBDevice[]> {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.usb === 'undefined'
  ) {
    return Promise.resolve([]);
  }
  return navigator.usb.getDevices();
}

export function findUSBDevice(
  info: USBDeviceInfo,
  devices: USBDevice[],
): USBDevice | undefined {
  return devices.find((device) => {
    return (
      device.deviceClass === info.deviceClass &&
      device.deviceProtocol === info.deviceProtocol &&
      device.deviceSubclass === info.deviceSubclass &&
      device.deviceVersionMajor === info.deviceVersionMajor &&
      device.deviceVersionMinor === info.deviceVersionMinor &&
      device.deviceVersionSubminor === info.deviceVersionSubminor &&
      device.manufacturerName === info.manufacturerName &&
      device.opened === info.opened &&
      device.productId === info.productId &&
      device.productName === info.productName &&
      device.serialNumber === info.serialNumber &&
      device.usbVersionMajor === info.usbVersionMajor &&
      device.usbVersionMinor === info.usbVersionMinor &&
      device.usbVersionSubminor === info.usbVersionSubminor &&
      device.vendorId === info.vendorId
    );
  });
}

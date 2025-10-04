import type { Product } from "../types";

export const products: Product[] = [
  // --- Headphones / Audio ---
  { id: "1", slug: "bt-headset-01", title: "Bluetooth Headphones Pro", price: 49900,
    tags:["headphones","bluetooth","wireless","audio"], stock: 12, rating: 4.5 },
  { id: "2", slug: "bt-headset-02", title: "Wireless Headphones Lite", price: 29900,
    tags:["headphones","wireless","bluetooth","audio"], stock: 20, rating: 4.2 },
  { id: "3", slug: "anc-headset-01", title: "ANC Over-Ear Headphones", price: 89900,
    tags:["headphones","anc","noise-cancelling","audio"], stock: 8, rating: 4.6 },

  // --- Keyboards ---
  { id: "4", slug: "mech-kb-01", title: "Mechanical Keyboard 87", price: 29900,
    tags:["keyboard","mechanical","tkl"], stock: 5, rating: 4.2 },
  { id: "5", slug: "mech-kb-60", title: "60% Compact Mechanical Keyboard", price: 25900,
    tags:["keyboard","mechanical","compact"], stock: 10, rating: 4.1 },
  { id: "6", slug: "mech-kb-100", title: "Full-size Mechanical Keyboard", price: 39900,
    tags:["keyboard","mechanical","fullsize"], stock: 6, rating: 4.4 },

  // --- Mice ---
  { id: "7", slug: "mouse-lite", title: "Lightweight Gaming Mouse", price: 15900,
    tags:["mouse","gaming","lightweight"], stock: 20, rating: 4.1 },
  { id: "8", slug: "mouse-wireless", title: "Wireless Mouse Silent", price: 19900,
    tags:["mouse","wireless","office"], stock: 25, rating: 4.0 },

  // --- Speakers & Audio ---
  { id: "9", slug: "spk-01", title: "Desktop Speaker", price: 39900,
    tags:["speaker","audio","desktop"], stock: 8, rating: 4.3 },
  { id: "10", slug: "spk-soundbar", title: "PC Soundbar with RGB", price: 34900,
    tags:["speaker","soundbar","audio","rgb"], stock: 9, rating: 4.2 },

  // --- Monitors ---
  { id: "11", slug: "monitor-27", title: "27\" Monitor 144Hz", price: 129900,
    tags:["monitor","144hz","gaming"], stock: 6, rating: 4.6 },
  { id: "12", slug: "monitor-24", title: "24\" IPS Monitor", price: 89900,
    tags:["monitor","ips","office"], stock: 10, rating: 4.3 },

  // --- Webcam / Mic ---
  { id: "13", slug: "webcam-4k", title: "4K Webcam", price: 89900,
    tags:["webcam","camera","video"], stock: 7, rating: 4.4 },
  { id: "14", slug: "webcam-1080", title: "1080p Autofocus Webcam", price: 39900,
    tags:["webcam","camera","video"], stock: 12, rating: 4.1 },
  { id: "15", slug: "mic-usb", title: "USB Condenser Microphone", price: 69900,
    tags:["microphone","usb","audio","streaming"], stock: 9, rating: 4.3 },

  // --- Hubs / Accessories ---
  { id: "16", slug: "usb-c-hub", title: "USB-C Hub 7-in-1", price: 19900,
    tags:["hub","usbc","accessory"], stock: 30, rating: 4.2 },
  { id: "17", slug: "sd-reader", title: "USB-C SD Card Reader", price: 12900,
    tags:["reader","usbc","accessory"], stock: 40, rating: 4.0 },

  // --- Chairs / Desks ---
  { id: "18", slug: "chair-ergonomic", title: "Ergonomic Chair", price: 259900,
    tags:["chair","ergonomic","office"], stock: 4, rating: 4.5 },
  { id: "19", slug: "chair-mesh", title: "Mesh Office Chair", price: 199900,
    tags:["chair","office","mesh"], stock: 7, rating: 4.2 },

  // --- Extras for keyboard similarity ---
  { id: "20", slug: "kb-lowprofile", title: "Low-Profile Wireless Keyboard", price: 34900,
    tags:["keyboard","wireless","low-profile"], stock: 14, rating: 4.1 },
];

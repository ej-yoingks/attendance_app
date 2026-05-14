# 📱 Simple Attendance Application

## Overview

The **Simple Attendance Application** is a mobile application designed to record and manage student attendance efficiently. It replaces traditional manual attendance methods such as roll calling or paper-based lists.

The system allows teachers to quickly mark students as **Present** or **Absent**, automatically saving attendance records for easy access and organization.

This project is developed as a **school project** using **React Native**, **Expo Go**, and **Firebase**.

---

## Objectives

* Digitize classroom attendance recording
* Reduce time spent taking attendance
* Minimize recording errors
* Store attendance data securely in the cloud
* Provide easy access to attendance history

---

## Features

* Teacher login authentication using Firebase Authentication
* Class or subject selection
* Mark students as Present or Absent
* Save attendance records to Firebase Firestore
* View attendance history
* Real-time cloud synchronization
* Secure logout system

---

## System Flow

1. Teacher logs into the application
2. Firebase Authentication verifies credentials
3. Teacher selects a class
4. System loads student list from Firestore
5. Teacher marks attendance
6. Attendance data is saved to Firestore
7. Teacher views attendance records
8. Teacher logs out

---

## Tech Stack

* React Native
* Expo Go
* JavaScript
* Firebase Authentication
* Firebase Firestore Database

---

## Firebase Services Used

* **Firebase Authentication** — user login system
* **Cloud Firestore** — attendance data storage
* **Firebase Hosting (optional)** — future deployment

---

## Installation Guide

### Prerequisites

* Node.js (LTS Version)
* npm or yarn
* Expo Go mobile app
* Firebase account

Install Expo CLI:

```bash
npm install -g expo-cli
```

---

### Clone Repository

```bash
git clone https://github.com/your-username/simple-attendance-app.git
cd simple-attendance-app
```

---

### Install Dependencies

```bash
npm install
```

---

### Install Firebase

```bash
npm install firebase
```

---

### Firebase Setup

1. Go to https://console.firebase.google.com
2. Create a new Firebase project
3. Enable **Authentication → Email/Password**
4. Create **Cloud Firestore Database**
5. Register a Web App in Firebase
6. Copy Firebase configuration keys
7. Create a file:

```
services/firebaseConfig.js
```

Add your Firebase configuration inside the file.

---

### Run the Application

```bash
npx expo start
```

Open **Expo Go** on your mobile device and scan the QR code.

---

## Project Structure

```
simple-attendance-app/
│
├── assets/
├── components/
├── screens/
├── navigation/
├── services/
│   └── firebaseConfig.js
├── utils/
├── App.js
└── README.md
```

---

## Project Status

🚧 Under Development

---

## Future Improvements

* QR Code Attendance
* Offline Mode Support
* Push Notifications
* Analytics Dashboard
* Attendance Report Export (PDF/Excel)

---

## Developers

* Eubert Jason Yoingco
* Mark Jay Bueno
* Janet Alberto
* Judilyn Gida

---

## License

This project is for educational purposes only.

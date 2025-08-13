# WhatsApp Web Clone 🚀

A full-stack WhatsApp Web clone that processes webhook payloads and displays real-time conversations with a responsive, mobile-friendly interface.

## 🌟 Features

### ✨ **Core Functionality**
- 📱 **WhatsApp Web-like Interface** - Pixel-perfect clone of the original design
- 💬 **Real-time Messaging** - WebSocket integration with Socket.IO
- 📊 **Message Status Tracking** - Sent, Delivered, Read indicators
- 👥 **Conversation Management** - Grouped conversations by contact
- 📤 **Send Messages** - Demo message sending with database storage
- 🔄 **Status Updates** - Real-time status update processing

### 🎨 **User Interface**
- 📱 **Fully Responsive** - Works seamlessly on mobile and desktop
- 🌙 **WhatsApp Theme** - Authentic colors and styling
- ⚡ **Real-time Updates** - Live message and status updates
- 🔍 **Search Functionality** - Search conversations and contacts
- 📅 **Message Grouping** - Messages grouped by date
- ⏰ **Smart Time Display** - Today, Yesterday, or full date format

### 🛠 **Technical Features**
- 🗄️ **MongoDB Integration** - Efficient message storage and retrieval
- 🔌 **WebSocket Support** - Real-time bidirectional communication
- 📡 **Webhook Processing** - WhatsApp Business API webhook simulation
- 🚀 **Sample Data Loader** - Easy testing with sample webhook payloads
- 🐛 **Debug Endpoints** - Development tools for troubleshooting
- 📊 **Status Analytics** - Message status distribution tracking

## 🚀 Live Demo

🌐 **[View Live Application](https://whatsapp-web-frontend-8wh6.onrender.com)**

## 📋 Table of Contents

- [Features](#-features)
- [Live Demo](#-live-demo)
- [Tech Stack](#️-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Setup](#️-environment-setup)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [WebSocket Events](#-websocket-events)
- [Sample Data](#-sample-data)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🛠️ Tech Stack

### **Frontend**
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Socket.IO Client** for real-time communication
- **Axios** for API requests

### **Backend**
- **Node.js** with Express.js
- **Socket.IO** for WebSocket connections
- **MongoDB** with Mongoose ODM
- **ES Modules** (modern JavaScript)

### **Database**
- **MongoDB Atlas** (Cloud database)
- **Collections**: `messages` for storing conversations

### **Deployment**
- **Frontend**: Vercel/Netlify
- **Backend**: Render/Heroku/Railway
- **Database**: MongoDB Atlas

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **MongoDB Atlas** account (or local MongoDB)
- **Git** for version control

## 🚀 Installation

### 1. **Clone the Repository**

```bash
git clone https://github.com/Utkarsh7545/Whatsapp-Web.git
cd Whatsapp-Web
```

### 2. **Install Backend Dependencies**

```bash
# Navigate to backend directory
cd server
npm install
```

### 3. **Install Frontend Dependencies**

```bash
# Navigate to frontend directory
cd ../client
npm install
```

## ⚙️ Environment Setup

### **Backend Environment (.env)**

Create a `.env` file in the `server` directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp
DB_NAME=whatsapp

# Server Configuration
PORT=8000

# Business Configuration
BUSINESS_PHONE_NUMBER=918329446654

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Socket.IO Configuration
SOCKET_IO_ORIGINS=http://localhost:5173
```

### **Frontend Environment (.env)**

Create a `.env` file in the `client` directory:

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_SOCKET_URL=http://localhost:8000

# App Configuration
REACT_APP_APP_NAME=WhatsApp Web Clone
```

### **MongoDB Atlas Setup**

1. **Create MongoDB Atlas Account**: [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. **Create a New Cluster**
3. **Create Database User** with read/write permissions
4. **Whitelist Your IP** or allow access from anywhere (0.0.0.0/0)
5. **Get Connection String** and update `MONGODB_URI` in your `.env`

## 💻 Usage

### **Development Mode**

#### 1. **Start Backend Server**
```bash
cd server
npm run dev
# Server runs on http://localhost:8000
```

#### 2. **Start Frontend Development Server**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

#### 3. **Load Sample Data**
- Open the application in your browser
- Click the **"Load Sample Data"** button in the sidebar
- Sample conversations will be loaded from the `server/data` directory

### **Production Mode**

#### **Backend**
```bash
cd server
npm run build
npm start
```

#### **Frontend**
```bash
cd client
npm run build
npm run preview
```

## 📡 API Documentation

### **Message Endpoints**

#### `GET /api/messages/conversations`
Get all conversations grouped by contact.

**Response:**
```json
[
  {
    "_id": "919876543210",
    "phoneNumber": "919876543210",
    "contactName": "John Doe",
    "lastMessage": "Hey, how are you?",
    "lastTimestamp": "2024-01-15T10:30:00.000Z",
    "unreadCount": 2
  }
]
```

#### `GET /api/messages/conversation/:phoneNumber`
Get all messages for a specific conversation.

**Response:**
```json
[
  {
    "_id": "message_id_here",
    "messageId": "wamid.unique_id",
    "from": "919876543210",
    "to": "918329446654",
    "body": "Hello there!",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "status": "read",
    "isOutgoing": false,
    "contactName": "John Doe"
  }
]
```

#### `POST /api/messages/send`
Send a new message.

**Request Body:**
```json
{
  "to": "919876543210",
  "body": "Hello from WhatsApp Web!",
  "contactName": "John Doe"
}
```

#### `POST /api/messages/load-sample`
Load sample data from JSON files in the `data` directory.

**Response:**
```json
{
  "message": "Sample data loaded successfully",
  "messagesCount": 150,
  "statusUpdatesCount": 75,
  "filesProcessed": 5
}
```

### **Debug Endpoints** (Development)

#### `GET /api/messages/debug/status-updates`
Check status update statistics.

#### `GET /api/messages/debug/sample-files`
Analyze sample data files.

## 🔌 WebSocket Events

### **Client → Server Events**

- `join-conversation` - Join a specific conversation room
- `send-message` - Send a new message
- `message-status-update` - Update message status

### **Server → Client Events**

- `new-message` - New message received
- `message-sent` - Message sent confirmation
- `status-updated` - Message status updated

## 📊 Sample Data

Place your WhatsApp Business API webhook JSON files in the `server/data` directory:

```
server/
├── data/
│   ├── webhook_messages_1.json
│   ├── webhook_status_1.json
│   ├── webhook_messages_2.json
│   └── ...
```

### **Expected JSON Structure**

#### **Message Webhook:**
```json
{
  "metaData": {
    "entry": [
      {
        "changes": [
          {
            "field": "messages",
            "value": {
              "contacts": [...],
              "messages": [...]
            }
          }
        ]
      }
    ]
  }
}
```

#### **Status Webhook:**
```json
{
  "payload_type": "whatsapp_webhook",
  "metaData": {
    "entry": [
      {
        "changes": [
          {
            "field": "messages",
            "value": {
              "statuses": [
                {
                  "id": "wamid.message_id",
                  "status": "read",
                  "timestamp": "1674646200",
                  "recipient_id": "919876543210"
                }
              ]
            }
          }
        ]
      }
    ]
  }
}
```

## 📁 Project Structure

```
whatsapp-web-clone/
├── server/
│   ├── data/                    # Sample webhook JSON files
│   ├── models/
│   │   └── Message.js          # MongoDB message schema
│   ├── routes/
│   │   ├── messages.js         # Message API routes
│   │   └── webhook.js          # Webhook processing routes
│   ├── socket/
│   │   └── socketHandlers.js   # Socket.IO event handlers
│   ├── .env                    # Environment variables
│   ├── server.js               # Express server entry point
│   └── package.json
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx     # Conversations sidebar
│   │   │   └── ChatArea.tsx    # Message chat interface
│   │   ├── services/
│   │   │   └── api.ts          # API service functions
│   │   ├── types/
│   │   │   └── index.ts        # TypeScript type definitions
│   │   ├── App.tsx             # Main React component
│   │   └── index.tsx           # React entry point
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── .env                    # Environment variables
│   └── package.json
└── README.md
```

## 🚀 Deployment

### **Option 1: Vercel + Render**

#### **Frontend (Vercel)**
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

#### **Backend (Render)**
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Set environment variables in Render dashboard

### **Option 2: Full Stack on Railway**

1. Connect your GitHub repository to Railway
2. Deploy both frontend and backend services
3. Set up environment variables
4. Configure custom domains if needed

### **Environment Variables for Production**

**Backend:**
```env
MONGODB_URI=your_production_mongodb_uri
FRONTEND_URL=https://your-frontend-domain.com
PORT=8000
```

**Frontend:**
```env
REACT_APP_API_BASE_URL=https://your-backend-domain.com
REACT_APP_SOCKET_URL=https://your-backend-domain.com
```

## 🧪 Testing

### **Manual Testing**

1. **Load Sample Data**: Click "Load Sample Data" button
2. **View Conversations**: Check if conversations appear in sidebar
3. **Select Conversation**: Click on a conversation to view messages
4. **Send Message**: Type and send a test message
5. **Status Updates**: Verify message status indicators
6. **Real-time**: Test with multiple browser tabs

### **Debug Commands**

```bash
# Check status updates
curl http://localhost:8000/api/messages/debug/status-updates

# Analyze sample files
curl http://localhost:8000/api/messages/debug/sample-files
```

## 🐛 Troubleshooting

### **Common Issues**

#### **MongoDB Connection Failed**
- ✅ Check your MongoDB URI in `.env`
- ✅ Verify network access in MongoDB Atlas
- ✅ Ensure correct username/password

#### **CORS Issues**
- ✅ Check `FRONTEND_URL` in server `.env`
- ✅ Verify frontend URL matches exactly

#### **Socket.IO Not Connecting**
- ✅ Ensure backend server is running
- ✅ Check `REACT_APP_SOCKET_URL` in client `.env`
- ✅ Verify firewall settings

#### **Sample Data Not Loading**
- ✅ Check if `server/data` directory exists
- ✅ Verify JSON file format
- ✅ Check console logs for errors

#### **Status Updates Not Working**
- ✅ Ensure your JSON files have `statuses` arrays
- ✅ Check message IDs match between messages and statuses
- ✅ Use debug endpoints to verify data

## 🏆 Project Requirements Completion

✅ **Task 1: Webhook Payload Processor**
- ✅ MongoDB cluster setup
- ✅ JSON payload processing
- ✅ Message insertion into `processed_messages` collection
- ✅ Status update processing using `id`/`meta_msg_id`

✅ **Task 2: WhatsApp Web Interface**
- ✅ WhatsApp Web-like UI design
- ✅ Conversations grouped by user (`wa_id`)
- ✅ Message bubbles with date/time
- ✅ Status indicators (sent, delivered, read)
- ✅ User info display (name and number)
- ✅ Responsive design for mobile and desktop

✅ **Task 3: Send Message Demo**
- ✅ WhatsApp-like message input box
- ✅ Messages appear in conversation UI
- ✅ Messages saved to database
- ✅ No external message sending (demo only)

✅ **Task 4: Deployment**
- ✅ Ready for public URL deployment
- ✅ All components production-ready

✅ **Bonus: Real-time WebSocket**
- ✅ Socket.IO implementation
- ✅ Real-time message updates
- ✅ Real-time status updates
- ✅ No manual refresh required

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@Utkarsh7545](https://github.com/Utkarsh7545)
- LinkedIn: [LinkedIn](https://www.linkedin.com/in/utkarsh-kumar-patel-b01449237)
- Email: utkarshkumar7545@gmail.com

## 🙏 Acknowledgments

- WhatsApp for the original design inspiration
- Meta for the WhatsApp Business API documentation
- The amazing open-source community

---

## 📞 Support

If you have any questions or run into issues:

1. **Check the [Troubleshooting](#-troubleshooting) section**
2. **Search existing [GitHub Issues](https://github.com/Utkarsh7545/Whatsapp-Web/issues)**
3. **Create a new issue** with detailed description and logs
4. **Contact the developer** via email or LinkedIn

---

⭐ **If you found this project helpful, please give it a star!** ⭐

**Built with ❤️ for the Full Stack Developer Evaluation Task**

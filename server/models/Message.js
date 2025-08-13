import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  messageId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  from: { 
    type: String, 
    required: true,
    index: true
  },
  to: { 
    type: String, 
    required: true,
    index: true
  },
  body: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    default: 'text' 
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  status: { 
    type: String, 
    enum: ['sent', 'delivered', 'read'], 
    default: 'sent' 
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  contactName: { 
    type: String,
    default: function() {
      return this.isOutgoing ? this.to : this.from;
    }
  },
  isOutgoing: { 
    type: Boolean, 
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Add compound indexes for better query performance
messageSchema.index({ from: 1, timestamp: -1 });
messageSchema.index({ to: 1, timestamp: -1 });
messageSchema.index({ from: 1, to: 1, timestamp: 1 });

// Pre-save middleware to track status changes
messageSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  
  // If status is being updated, add to history
  if (update.status || update.$set?.status) {
    const newStatus = update.status || update.$set.status;
    
    if (!update.$push) update.$push = {};
    update.$push.statusHistory = {
      status: newStatus,
      timestamp: new Date()
    };
  }
  
  next();
});

// Virtual for formatted timestamp
messageSchema.virtual('formattedTime').get(function() {
  if (!this.timestamp || isNaN(new Date(this.timestamp).getTime())) {
    return 'Invalid Time';
  }
  return new Date(this.timestamp).toLocaleString();
});

export default mongoose.model('Message', messageSchema);

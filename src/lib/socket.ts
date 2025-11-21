import { Server } from 'socket.io';

export function setupSocket(io: Server) {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle custom events
    socket.on('join-project', (projectId: string) => {
      socket.join(projectId);
      console.log(`User ${socket.id} joined project ${projectId}`);
    });

    socket.on('leave-project', (projectId: string) => {
      socket.leave(projectId);
      console.log(`User ${socket.id} left project ${projectId}`);
    });

    socket.on('project-update', (data: { projectId: string; update: any }) => {
      socket.to(data.projectId).emit('project-updated', data.update);
    });

    socket.on('record-added', (data: { projectId: string; record: any }) => {
      socket.to(data.projectId).emit('record-added', data.record);
    });

    socket.on('record-updated', (data: { projectId: string; record: any }) => {
      socket.to(data.projectId).emit('record-updated', data.record);
    });

    socket.on('record-deleted', (data: { projectId: string; recordId: string }) => {
      socket.to(data.projectId).emit('record-deleted', data.recordId);
    });

    socket.on('payment-added', (data: { projectId: string; payment: any }) => {
      socket.to(data.projectId).emit('payment-added', data.payment);
    });

    socket.on('payment-updated', (data: { projectId: string; payment: any }) => {
      socket.to(data.projectId).emit('payment-updated', data.payment);
    });

    socket.on('payment-deleted', (data: { projectId: string; paymentId: string }) => {
      socket.to(data.projectId).emit('payment-deleted', data.paymentId);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}
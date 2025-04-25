package com.example.taskmanager.service;

import com.example.taskmanager.model.Task;
import com.example.taskmanager.model.User;
import com.example.taskmanager.repository.TaskRepository;
import com.example.taskmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Autowired
    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }

    private User getCurrentUser() {
        return userRepository.findByUsername(getCurrentUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public Task createTask(Task task) {
        task.setUser(getCurrentUser());
        return taskRepository.save(task);
    }

    public List<Task> getAllTasksForCurrentUser() {
        return taskRepository.findByUserUsername(getCurrentUsername());
    }

    public Task getTaskForCurrentUser(Long id) {
        return taskRepository.findByIdAndUserUsername(id, getCurrentUsername())
                .orElseThrow(() -> new RuntimeException("Task not found or not owned by user"));
    }

    @Transactional
    public Task updateTask(Long id, Task taskDetails) {
        Task task = getTaskForCurrentUser(id);
        
        task.setTitle(taskDetails.getTitle());
        task.setCompleted(taskDetails.isCompleted());
        
        return taskRepository.save(task);
    }

    @Transactional
    public void deleteTask(Long id) {
        Task task = getTaskForCurrentUser(id);
        taskRepository.delete(task);
    }
}
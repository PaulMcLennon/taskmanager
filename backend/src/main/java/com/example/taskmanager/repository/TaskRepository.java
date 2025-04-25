package com.example.taskmanager.repository;

import com.example.taskmanager.model.Task;
import com.example.taskmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {
    
    // Encuentra todas las tareas de un usuario específico
    List<Task> findByUser(User user);
    
    // Encuentra tareas por nombre de usuario
    List<Task> findByUserUsername(String username);
    
    // Encuentra una tarea específica por ID y nombre de usuario
    Optional<Task> findByIdAndUserUsername(Long id, String username);
    
    // Versión alternativa con @Query
    @Query("SELECT t FROM Task t WHERE t.user.username = :username AND t.id = :id")
    Optional<Task> findUserTaskById(@Param("username") String username, @Param("id") Long id);
    
    // Encuentra tareas completadas/incompletas de un usuario
    List<Task> findByUserUsernameAndCompleted(String username, boolean completed);
    
    // Cuenta las tareas de un usuario
    long countByUserUsername(String username);
}
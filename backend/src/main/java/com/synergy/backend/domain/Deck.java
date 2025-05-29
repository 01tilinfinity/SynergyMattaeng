// 🔧 Deck.java (Entity 클래스 전체)
package com.synergy.backend.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;

@Entity
public class Deck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String username;
    private LocalDateTime createdAt;

    @Lob
    private String champions;

    private int likes; // ✅ 추천 수

    // Getters / Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getChampions() { return champions; }
    public void setChampions(String champions) { this.champions = champions; }

    public int getLikes() { return likes; }
    public void setLikes(int likes) { this.likes = likes; }
}

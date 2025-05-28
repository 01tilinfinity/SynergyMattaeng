package com.synergy.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.synergy.backend.domain.Deck;

public interface DeckRepository extends JpaRepository<Deck, Long> {
    List<Deck> findAllByOrderByCreatedAtDesc();

    // ✅ 특정 사용자(username)의 덱만 조회하는 메서드 추가
    List<Deck> findByUsername(String username);
}

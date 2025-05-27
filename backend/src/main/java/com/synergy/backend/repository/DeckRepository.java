package com.synergy.backend.repository;

import com.synergy.backend.domain.Deck;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DeckRepository extends JpaRepository<Deck, Long> {
    List<Deck> findAllByOrderByCreatedAtDesc();
}

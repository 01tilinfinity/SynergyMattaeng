package com.synergy.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.synergy.backend.domain.Deck;
import com.synergy.backend.repository.DeckRepository;

@RestController
@RequestMapping("/api/decks")
@CrossOrigin(origins = "*")
public class DeckController {

    private final DeckRepository deckRepository;
    private final ObjectMapper objectMapper;

    public DeckController(DeckRepository deckRepository) {
        this.deckRepository = deckRepository;
        this.objectMapper = new ObjectMapper();
    }

    @PostMapping
    public Deck createDeck(@RequestBody Map<String, Object> payload) {
        try {
            String name = (String) payload.get("name");
            String username = (String) payload.get("username");
            List<String> champions = (List<String>) payload.get("champions");

            Deck deck = new Deck();
            deck.setName(name);
            deck.setUsername(username);
            deck.setCreatedAt(LocalDate.now());
            deck.setChampions(objectMapper.writeValueAsString(champions)); // 리스트 → JSON 문자열

            return deckRepository.save(deck);
        } catch (Exception e) {
            throw new RuntimeException("덱 저장 중 오류 발생", e);
        }
    }

    @GetMapping
    public List<Deck> getDecks() {
        return deckRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/{id}")
    public Deck getDeckById(@PathVariable Long id) {
        return deckRepository.findById(id).orElse(null);
    }
}

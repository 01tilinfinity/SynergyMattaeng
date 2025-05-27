package com.synergy.backend.controller;

import com.synergy.backend.domain.Deck;
import com.synergy.backend.repository.DeckRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/decks")
@CrossOrigin(origins = "*")
public class DeckController {

    private final DeckRepository deckRepository;

    public DeckController(DeckRepository deckRepository) {
        this.deckRepository = deckRepository;
    }

    @PostMapping
    public Deck createDeck(@RequestBody Deck deck) {
        deck.setCreatedAt(LocalDate.now());
        return deckRepository.save(deck);
    }

    @GetMapping
    public List<Deck> getDecks() {
        return deckRepository.findAllByOrderByCreatedAtDesc();
    }
}

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

    // ✅ 덱 등록
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

            // List → JSON 문자열
            String championsJson = objectMapper.writeValueAsString(champions);
            deck.setChampions(championsJson);

            // 추천 수 초기화
            deck.setLikes(0);

            return deckRepository.save(deck);
        } catch (Exception e) {
            throw new RuntimeException("덱 저장 중 오류 발생", e);
        }
    }

    // ✅ 덱 전체 목록 조회 (최신순 정렬)
    @GetMapping
    public List<Deck> getDecks() {
        return deckRepository.findAllByOrderByCreatedAtDesc();
    }

    // ✅ 덱 상세 조회
    @GetMapping("/{id}")
    public Deck getDeckById(@PathVariable Long id) {
        return deckRepository.findById(id).orElse(null);
    }

    // ✅ 추천 API
    @PostMapping("/{id}/like")
    public Deck likeDeck(@PathVariable Long id) {
        Deck deck = deckRepository.findById(id).orElseThrow(() -> new RuntimeException("덱을 찾을 수 없습니다."));
        deck.setLikes(deck.getLikes() + 1);
        return deckRepository.save(deck);
    }

    // ✅ 특정 유저의 덱 목록 조회 (마이페이지용)
    @GetMapping("/user/{username}")
    public List<Deck> getDecksByUsername(@PathVariable String username) {
        return deckRepository.findByUsername(username);
    }
}

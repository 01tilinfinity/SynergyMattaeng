package com.synergy.backend.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.synergy.backend.domain.User;
import com.synergy.backend.repository.UserRepository;

@RestController
@CrossOrigin(origins = "*") // 프론트 요청 허용
@RequestMapping("/api")
public class UserController {

  @Autowired
  private UserRepository userRepository;

  @PostMapping("/signup")
  public Map<String, String> signup(@RequestBody Map<String, String> body) {
    System.out.println("🔥 [signup] 받은 body: " + body); // 로그 1
  
    try {
      String username = body.get("username");
      String rawPassword = body.get("password");
  
      System.out.println("🔥 [signup] username: " + username); // 로그 2
      System.out.println("🔥 [signup] password: " + rawPassword); // 로그 3
  
      String hashedPassword = BCrypt.hashpw(rawPassword, BCrypt.gensalt());
  
      User user = new User();
      user.setUsername(username);
      user.setPassword(hashedPassword);
  
      System.out.println("🔥 [signup] 저장 전 user 객체: " + user); // 로그 4
  
      userRepository.save(user);
  
      System.out.println("✅ [signup] 저장 완료");
  
      return Map.of("status", "ok");
  
    } catch (Exception e) {
      System.out.println("❌ [signup] 에러 발생:");
      e.printStackTrace(); // 여기에 핵심 에러 출력됨
      return Map.of("status", "error", "message", e.getMessage());
    }
  }
  

  @PostMapping("/login")
  public Map<String, String> login(@RequestBody Map<String, String> body) {
    String username = body.get("username");
    String password = body.get("password");

    Optional<User> optionalUser = userRepository.findByUsername(username);
    Map<String, String> result = new HashMap<>();

    if (optionalUser.isPresent() && BCrypt.checkpw(password, optionalUser.get().getPassword())) {
      result.put("status", "ok");
      result.put("username", username);
    } else {
      result.put("status", "error");
    }

    return result;
  }
}

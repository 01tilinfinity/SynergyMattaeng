package com.synergy.backend.controller;

import com.synergy.backend.domain.User;
import com.synergy.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*") // 프론트 요청 허용
@RequestMapping("/api")
public class UserController {

  @Autowired
  private UserRepository userRepository;

  @PostMapping("/signup")
  public Map<String, String> signup(@RequestBody Map<String, String> body) {
    String username = body.get("username");
    String password = BCrypt.hashpw(body.get("password"), BCrypt.gensalt());

    User user = new User();
    user.setUsername(username);
    user.setPassword(password);
    userRepository.save(user);

    return Map.of("status", "ok");
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

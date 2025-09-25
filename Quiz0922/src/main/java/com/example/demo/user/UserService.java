package com.example.demo.user;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
	
	private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

	
	public void signup(UserDto dto) {
		
        // 아이디 중복 체크
        if (userRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }
        
        // 닉네임 중복 체크
        if (userRepository.findByNickname(dto.getNickname()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }
        
        // 비밀번호 확인
        if (! dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        // DTO → 엔티티 변환
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setNickname(dto.getNickname());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setCharacterType(dto.getCharacterType());
        user.setRole(UserRole.USER); // 기본 권한 USER
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);
        
	}

}


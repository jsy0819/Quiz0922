package com.example.demo.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long>{
	// 유저네임 찾기
	Optional<User> findByUsername(String username);
	
	// 닉네임 찾기
    Optional<User> findByNickname(String nickname);
}

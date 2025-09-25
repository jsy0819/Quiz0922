package com.example.demo.user;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "memory_users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 아이디
    @Column(unique = true, nullable = false)
    @NotBlank(message = "아이디는 필수 입력값입니다.")
    @Size(min = 4, max = 20, message = "아이디는 영문, 숫자로 4~20자여야 합니다.")
    private String username;
    
    // 닉네임(nickname)
    @Column(unique = true, nullable = false)
    @NotBlank(message = "네임은 필수 입력값입니다.")
    @Size(min = 2, max = 10, message = "닉네임은 2~10자여야 합니다.")
    private String nickname;
    
    // 비밀번호(password)
    @Column(nullable = false)
    @NotBlank(message = "비밀번호는 필수 입력값입니다.")
    @Size(min = 6, message = "비밀번호는 6자 이상이어야 합니다.")
    private String password;
    
    // 권한(USER("ROLE_USER"), ADMIN("ROLE_ADMIN"))
    @Enumerated(EnumType.STRING)
    private UserRole role;
    
    // 캐릭터(TANGO, TOSIM, WAFFLEBEAR, BUSYDOG)
    @Enumerated(EnumType.STRING)
    private CharacterType characterType;
    
    // 가입일자
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.role == null) {
            this.role = UserRole.USER;
        }
    }
    
}


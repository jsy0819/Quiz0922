package com.example.demo.user;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDto {

	// 아이디
    @NotBlank(message = "아이디는 필수 입력값입니다.")
    @Size(min = 4, max = 20, message = "아이디는 영문, 숫자로 4~20자여야 합니다.")
    private String username;

    // 닉네임
    @NotBlank(message = "닉네임은 필수 입력값입니다.")
    @Size(min = 2, max = 10, message = "닉네임은 2~10자여야 합니다.")
    private String nickname;

    // 비밀번호
    @NotBlank(message = "비밀번호는 필수 입력값입니다.")
    @Size(min = 6, message = "비밀번호는 6자 이상이어야 합니다.")
    private String password;

    // 비밀번호 확인(User.java 미포함)
    @NotBlank(message = "비밀번호 확인은 필수 입력값입니다.")
    private String confirmPassword;

    // 캐릭터
    private CharacterType characterType;

    // 약관 동의(User.java 미포함)
    @AssertTrue(message = "약관에 동의해야 가입할 수 있습니다.") 
    private boolean termsAgreed;
    

}

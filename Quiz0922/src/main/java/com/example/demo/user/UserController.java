package com.example.demo.user;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;

	@GetMapping("/register")
	public String registerForm(Model model) {
		model.addAttribute("userDTO", new UserDto());
		return "signup";
	}

	@PostMapping("/register")
	public String register(@Valid @ModelAttribute("userDTO") UserDto userDTO, BindingResult bindingResult,
			Model model) {
		
        if (bindingResult.hasErrors()) {
            return "signup";
        }
        
		try {
			userService.signup(userDTO);
			model.addAttribute("success", "회원가입이 완료되었습니다, 로그인 해주세요.");
			return "redirect:/login";
			
		} catch (IllegalArgumentException e) {
			model.addAttribute("error", e.getMessage());
			return "signup";
		}
	}

	@GetMapping("/login")
	public String showLoginForm() {
		return "login";
	}
}

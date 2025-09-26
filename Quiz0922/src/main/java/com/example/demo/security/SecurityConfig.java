package com.example.demo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Configuration
public class SecurityConfig   {

	private final MemoryAuthenticationSuccessHandler successHandler;
	private final MemoryAuthenticationFaliureHandler failureHandler;
	
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	
	@Bean
    public SecurityFilterChain clubFilterChain(HttpSecurity http) throws Exception {

		return http
		        .csrf(csrf -> csrf.ignoringRequestMatchers("/h2-console/**")) // CSRF 무시
		        .headers(headers -> headers.frameOptions().sameOrigin())
		        .sessionManagement(session -> session
					.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
					.maximumSessions(1)
					.maxSessionsPreventsLogin(false)
					)
				.authorizeHttpRequests(auth -> auth
	                    .requestMatchers("/", "/index", "/login", "/register",
                                "/css/**", "/js/**", "/images/**", "/favicon.ico").permitAll()
	                    // 관리자 전용 구역
	                    .requestMatchers("/admin/**").hasRole("ADMIN")     
	                    .requestMatchers("/h2-console/**").permitAll()
	                    // 나머지는 인증 필요
	                    .anyRequest().authenticated()
	                )
				// Login 설정
	              .formLogin(form -> form
	              .loginPage("/login")                    				// 로그인 페이지 URL
	              .usernameParameter("username")               					// 아이디 파라미터명
	              .passwordParameter("password")               					// 비밀번호 파라미터명
	              .defaultSuccessUrl("/", true)       					// 로그인 성공 시 이동할 페이지
	              .failureUrl("/login?error=true")        					// 로그인 실패 시 이동할 페이지
	              .successHandler(successHandler)              					// 성공 핸들러
	              .failureHandler(failureHandler)              					// 실패 핸들러
	              .permitAll()
	          )
                // Logout 설정
                .logout(logout -> logout
                    .logoutUrl("/logout")                   		// 로그아웃 URL
                    .logoutSuccessUrl("/") 		// 로그아웃 성공 시 이동할 페이지
                    .invalidateHttpSession(true)               		 	// 세션 무효화
                    .deleteCookies("JSESSIONID")                		// 쿠키 삭제
                    .clearAuthentication(true)                  		// 인증 정보 삭제
                    .permitAll()
                )
	              .exceptionHandling(ex -> ex
	        		// 인증되지 않은 사용자가 접근을 시도했다면 해당 요청 URI 를 출력.
	        		// authenticationEntryPoint 인증되지 않은 상태
	            .authenticationEntryPoint((request, response, authException) -> {
	                System.out.println("인증되지 않은 접근 시도: " + request.getRequestURI()+ "이 메시지는 config 예외처리 메시지입니다");
	                response.sendRedirect("/login");
	            })
	            // accessDeniedHandler 인증은 되었으나 권한이 없는 경우
	            // 사용자가 권한이 부족한 상태에서 특정 리소스에 접근하려할때 호출
	            .accessDeniedHandler((request, response, accessDeniedException) -> {
	                System.out.println("권한 없는 접근 시도: " + request.getRequestURI()+ "이 메시지는 config 예외처리 메시지입니다");
	                response.sendRedirect("/login");
	            })
	            )
				.build();		
	}
    
	
}

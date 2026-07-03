package com.savora.demo.service.implementService;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.savora.demo.Configuration.JwtProvider;
import com.savora.demo.Exception.UserException;
import com.savora.demo.modal.User;
import com.savora.demo.modal.enums.UserRole;
import com.savora.demo.repository.UserRepository;
import com.savora.demo.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserImplementService implements UserService {
    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User getUserFromJwttoken(String token) throws UserException {
        String email = jwtProvider.getEmailFromToken(token);
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            throw new UserException("User not found with email: " + email);
        }
        return user;

    }

    @Override
    public User getCurrentUser() throws UserException {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            throw new UserException("User not found with email: " + email);
        }
        return user;

    }

    @Override
    public User getUserByEmail(String email) throws UserException {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            throw new UserException("User not found with email: " + email);
        }
        return user;
    }

    @Override
    public User getUserById(Long id) throws UserException {
        User user = userRepository.findById(id).orElseThrow(
                () -> new UserException("User not found with id: " + id));

        return user;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User authenticate(String email, String rawPassword) throws UserException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserException("Invalid email or password"));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new UserException("Invalid email or password");
        }

        user.setLastLogin(java.time.LocalDateTime.now());
        return userRepository.save(user);
    }

    @Override
    public User register(String fullName, String email, String rawPassword) throws UserException {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new UserException("Email is already registered");
        }

        User user = new User();
        user.setEmail(email);
        user.setFullName(StringUtils.hasText(fullName) ? fullName : email.split("@")[0]);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(UserRole.USER);
        user.setLastLogin(java.time.LocalDateTime.now());
        return userRepository.save(user);
    }

    @Override
    public User processOAuthPostLogin(String email, String fullName) {
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFullName(StringUtils.hasText(fullName) ? fullName : email.split("@")[0]);
            newUser.setPassword(passwordEncoder.encode("oauth2-google-login"));
            newUser.setRole(UserRole.USER);
            return newUser;
        });

        if (StringUtils.hasText(fullName)) {
            user.setFullName(fullName);
        }
        user.setLastLogin(java.time.LocalDateTime.now());
        return userRepository.save(user);
    }

}

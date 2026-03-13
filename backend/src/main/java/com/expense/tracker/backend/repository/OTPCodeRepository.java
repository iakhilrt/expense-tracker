package com.expense.tracker.backend.repository;

import com.expense.tracker.backend.entity.OTPCode;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OTPCodeRepository extends JpaRepository<OTPCode, Long> {
    Optional<OTPCode> findByEmail(String email);
    void deleteByEmail(String email);
}

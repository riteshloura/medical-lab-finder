package com.lablocator.repository;

import com.lablocator.model.BookingTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingTestRepo extends JpaRepository<BookingTest, Long> {
}

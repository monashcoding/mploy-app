package com.mac.mploy.controller

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.web.bind.annotation.*

@RestController
@CrossOrigin(origins = ["http://localhost:3000"])
@RequestMapping("/api")
class HelloController(
    private val redis: StringRedisTemplate,
    @Value("\${spring.redis.host}") private val redisHost: String,
    @Value("\${spring.redis.port}") private val redisPort: Int
) {
    private val logger = LoggerFactory.getLogger(HelloController::class.java)

    @GetMapping("/hello")
    fun hello(): String {
        logger.info("Attempting to connect to Redis at {}:{}", redisHost, redisPort)
        try {
            val value = redis.opsForValue().get("greeting")
            logger.info("Successfully connected to Redis. Value: {}", value)
            return value ?: "Hello from Redis!"
        } catch (e: Exception) {
            logger.error("Failed to connect to Redis", e)
            throw e
        }
    }
}
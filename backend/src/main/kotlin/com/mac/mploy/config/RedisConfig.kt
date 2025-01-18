package com.mac.mploy.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.redis.connection.RedisStandaloneConfiguration
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory
import org.springframework.data.redis.core.StringRedisTemplate

@Configuration
class RedisConfig {
    @Value("\${spring.redis.host}")
    private lateinit var redisHost: String

    @Value("\${spring.redis.port}")
    private var redisPort: Int = 0

    @Bean
    fun lettuceConnectionFactory(): LettuceConnectionFactory {
        val configuration = RedisStandaloneConfiguration(redisHost, redisPort)
        return LettuceConnectionFactory(configuration)
    }

    @Bean
    fun stringRedisTemplate(connectionFactory: LettuceConnectionFactory): StringRedisTemplate {
        val template = StringRedisTemplate()
        template.connectionFactory = connectionFactory
        return template
    }
}
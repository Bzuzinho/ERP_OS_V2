<?php

namespace App;

/**
 * Application class for Junta Operacional
 *
 * Central point for application configuration and initialization
 */
class Application
{
    const VERSION = '1.0.0';
    const NAME = 'Junta Operacional';
    const DESCRIPTION = 'Sistema de Gestão Operacional para Juntas de Freguesia';

    /**
     * Get application name
     */
    public static function getName(): string
    {
        return self::NAME;
    }

    /**
     * Get application version
     */
    public static function getVersion(): string
    {
        return self::VERSION;
    }

    /**
     * Get application description
     */
    public static function getDescription(): string
    {
        return self::DESCRIPTION;
    }
}

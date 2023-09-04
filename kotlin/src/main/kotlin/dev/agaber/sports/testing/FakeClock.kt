package dev.agaber.sports.testing

import java.time.Clock
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

class FakeClock(
  private val now: Instant,
  private val zoneId: ZoneId = ZoneId.systemDefault(),
) : Clock() {
  constructor(now: LocalDate) : this(now.atStartOfDay(ZoneId.systemDefault()).toInstant())

  override fun instant(): Instant = now

  override fun withZone(zone: ZoneId): Clock = FakeClock(now, zone)

  override fun getZone() = zoneId
}

package com.lablocator.projection;

import java.time.LocalTime;

public interface NearbyLabProjection {
    Long getId();
    String getName();
    String getDescription();
    String getAddress();
    String getCity();
    String getState();
    String getContactNumber();
    Double getLatitude();
    Double getLongitude();
    Integer getSlotCapacityOnline();
    LocalTime getOpeningTime();
    LocalTime getClosingTime();

    Double getDistance();
}

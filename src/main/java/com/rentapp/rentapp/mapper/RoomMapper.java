package com.rentapp.rentapp.mapper;

import com.rentapp.rentapp.dto.RoomRequest;
import com.rentapp.rentapp.dto.RoomResponse;
import com.rentapp.rentapp.entity.Room;
import org.springframework.stereotype.Component;

@Component
public class RoomMapper {
    
    public Room toEntity(RoomRequest request) {
        Room room = new Room();
        room.setRoomNumber(request.getRoomNumber());
        room.setCapacity(request.getCapacity());
        room.setOccupiedCount(request.getOccupiedCount() != null ? request.getOccupiedCount() : 0);
        return room;
    }
    
    public RoomResponse toResponse(Room room) {
        return new RoomResponse(
            room.getId(),
            room.getRoomNumber(),
            room.getCapacity(),
            room.getOccupiedCount(),
            room.getAvailableBeds(),  // Computed field
            room.getProperty().getId(),
            room.getProperty().getName(),
            room.getCreatedAt(),
            room.getUpdatedAt()
        );
    }
    
    public void updateEntity(Room room, RoomRequest request) {
        room.setRoomNumber(request.getRoomNumber());
        room.setCapacity(request.getCapacity());
        if (request.getOccupiedCount() != null) {
            room.setOccupiedCount(request.getOccupiedCount());
        }
    }
}

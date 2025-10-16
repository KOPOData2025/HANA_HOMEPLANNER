package com.hana_ti.home_planner.domain.address.service;

import com.hana_ti.home_planner.domain.address.dto.AddressCreateDto;
import com.hana_ti.home_planner.domain.address.entity.Address;
import com.hana_ti.home_planner.domain.address.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AddressService {

    private final AddressRepository addressRepository;

    @Transactional
    public Address createAddress(AddressCreateDto dto) {
        Address address = Address.create(
                dto.getSido(),
                dto.getSigungu(),
                dto.getEupmyeondong(),
                dto.getRoadNm(),
                dto.getLat(),
                dto.getLon()
        );
        return addressRepository.save(address);
    }

    public Address findById(String addrId) {
        return addressRepository.findById(addrId)
                .orElseThrow(() -> new IllegalArgumentException("주소를 찾을 수 없습니다. ID: " + addrId));
    }
}